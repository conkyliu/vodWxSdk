//import fetch from 'isomorphic-fetch';
import Taro from '@tarojs/taro'
import {getCacheDataByExpire, setCacheDataAndTime, foreachStorage, removeCacheDataAndTime} from './storage';
import {mainHost, secondaryHost} from "./config";


//TODO 小程序的为头为header, 浏览器的为headers
let fetch = Taro.request;
let downloadFile = Taro.downloadFile;

//let mainHost = 'https://saas.jian1024.com',secondaryHost = 'https://console.jian1024.com';


export function checkStatus(response, options) {
  console.log(response, 'response');
  if (response.header['x-auth-token']) {
    //将cookies缓存到本地
    let key = options.hostType === 'org' ? 'x-auth-token-org' : 'x-auth-token-console';
    Taro.setStorageSync(key, response.header['x-auth-token']);

  }

  if (response.header['x-edu-code']) {
    Taro.setStorageSync('x-edu-code', response.header['x-edu-code'])
  }


  if (response.statusCode === 200) {
    return response;
  }
  if (response.statusCode >= 300) {
    let {hostType} = options;
    if (hostType === 'org') {
      // Taro.removeStorageSync('x-auth-token-org');
    }
  }
  const errorType = response.header['x-error-type'];
  const errorMessage = response.header['x-error-message'];


  const error = new Error(response.statusText);
  error.response = response;
  error.type = errorType || 'unknown';
  error.message = errorMessage ? decodeURI(errorMessage) : '出错啦';
  throw error;
}

export async function fetchRequest(url, options, isFile) {
  //如果需要清除缓存
  if (options && options.cacheEvict) {
    let cacheEvict = {type: 'window', key: url, ...options.cacheEvict};
    removeCacheDataAndTime(cacheEvict.type, cacheEvict.key);
    removeCacheDataAndTime(cacheEvict.type, cacheEvict.key + ':ts');
  }
  let {hostType} = options;
  if (!hostType) {
    hostType = 'org'
  }
  let targetUrl = hostType === 'org' ? mainHost + url : secondaryHost + url;
  let opts = {credentials: 'include', ...(options ? options : {})};


  if (!opts.body && opts.data) {
    //对于GET、DELETE请求，加在URL上面
    if (!opts.method || opts.method.match(/GET|DELETE/i)) {
      let params = {};
      for (let x in opts.data) {
        if (opts.data[x] != null) {
          //针对page做特殊处理，因为后台需要的页号是从0开始，前端的页号需要转换一下
          if (x === 'page') {
            params[x] = parseInt(opts.data[x]) - 1;
          } else if (opts.data[x] instanceof Array) {
            params[x] = opts.data[x].join(",");
          } else if (typeof (opts.data[x]) === 'object') {
            params[x] = JSON.stringify(opts.data[x]);
          } else {
            params[x] = opts.data[x];
          }
        }
      }
      opts.data = params;
    } else {
      if (opts.data && typeof (opts.data) === 'object') {

        //非GET、DELETE请求
        let params = [];
        for (let x in opts.data) {
          if (opts.data[x] != null) {
            if (opts.data[x] instanceof Array) {
              params.push(x + "=" + encodeURI(opts.data[x].join(',')));
            } else {
              params.push(x + "=" + encodeURI(opts.data[x]));
            }
          }
        }
        if (!opts.header) {
          opts.header = {};
        }
        opts.header['Content-Type'] = 'application/x-www-form-urlencoded';
        console.log('formData', opts.data, params);
        opts.data = params.join("&");

      }
    }

  } else if (opts.body && typeof (opts.body) === 'object') {
    // opts.body = JSON.stringify(opts.body);
    if (!opts.header) {
      opts.header = {};

    }
    opts.header['Content-Type'] = 'application/json';
    //小程序只接受data字段名
    opts.data = opts.body;
  }

  if (!opts.header) {
    opts.header = {};
  }

  //加入cookies
  let token = hostType === 'org' ? Taro.getStorageSync('x-auth-token-org') : Taro.getStorageSync('x-auth-token-console');
  if (token) {
    opts.header['x-auth-token'] = token;
  }

  //请求机构端域名时加上身份标识
  if (hostType === 'org') {
    opts.header['x-tenant-id'] = Taro.getStorageSync('x-tenant-id');
    opts.header['x-edu-code'] = Taro.getStorageSync('x-edu-code');
    opts.header['x-member-id'] = Taro.getStorageSync('x-member-id');
  }
  opts.header['x-user-agent'] = 'miniprogram';

  if (isFile) {
    opts.header = {
      'Content-Type': options.contentType
    };
    return downloadFile({url: targetUrl, ...opts})
  }

  return fetch({url: targetUrl, ...opts});

}

export async function request(url, options) {
  const response = await fetchRequest(url, options);

  checkStatus(response, options);


  const ret = {
    response,
    header: response.header,
  };

  return ret;
}

export async function requestJson(url, options) {

  const response = await fetchRequest(url, options);

  checkStatus(response, options);


  const data = await response.data;
  const ret = {data};
  //总页数
  if (response.header && response.header['x-page-count']) {
    console.log(response.header['x-page-count']);
    ret.page = {
      count: parseInt(response.header['x-count']),
      num: parseInt(response.header['x-page-num']),
      pageCount: parseInt(response.header['x-page-count']),
    };
  }

  return ret;
}

export async function requestJsonAndCache(url, options) {

  let cache = {key: url, type: 'window', timeout: 1000 * 60, ...options.cacheConfig};

  console.info(cache, "cac");
  foreachStorage();

  let data = await getCacheDataByExpire(cache.type, cache.key, cache.timeout);

  if (data) {
    return data;
  }
  data = await requestJson(url, options);

  setCacheDataAndTime(cache.type, cache.key, data);

  return data;
}

export async function requestText(url, options) {
  const response = await fetchRequest(url, options);

  checkStatus(response, options);

  const data = await response.data;
  console.log(data, 333);
  const ret = {
    data,
    header: response.header,
  };
  return ret;
}

export async function requestFile(url, options) {
  const response = await fetchRequest(url, options, true);
  checkStatus(response, options);
  const data = await response;
  console.log(data, 333);
  return data;

}


