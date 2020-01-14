import globalData, {set as setGlobalData, get as getGlobalData} from './global_data'


//遍历Storage的数据,找出过期并删除
export  const foreachStorage = (defaultTime = 60 * 1000) => {

  for (let [key, value] of Object.entries(globalData)) {
    if (key.includes(':ts')) {
      let whenCached = getGlobalData(key);
      let age = (Date.now() - whenCached);
      //默认清除1分钟以上的缓存
      if (age > defaultTime) {
        delete globalData[key];
        delete globalData[key.slice(0, key.length - 3)];
      }
    }
  }

/*
  for (let [key, value] of Object.entries(localStorage)) {
    if (key.includes(':ts')) {
      let whenCached = localStorage.getItem(key);
      let age = (Date.now() - whenCached);
      //默认清除1分钟以上的缓存
      if (age > defaultTime) {
        localStorage.removeItem(key);
        localStorage.removeItem(key.slice(0, key.length - 3));
      }
    }
  }
  for (let [key, value] of Object.entries(sessionStorage)) {
    if (key.includes(':ts')) {
      let whenCached = sessionStorage.getItem(key);
      let age = (Date.now() - whenCached);
      //默认清除1分钟以上的缓存
      if (age > defaultTime) {
        sessionStorage.removeItem(key);
        sessionStorage.removeItem(key.slice(0, key.length - 3));
      }
    }
  }
  */
};

const setCacheData = (type, key, value) => {
  if (type == 'window') {
    /* if (!window.cache) {
       window.cache = {};
     }
     window.cache[key] = value;*/

    setGlobalData(key, value);


  } else {
    let storage = type == 'session' ? sessionStorage : localStorage;
    storage.setItem(key, JSON.stringify(value));
  }
};

const getCacheData = (type, key) => {
  if (type == 'window') {
    /*    if (!window.cache) {
          return null;
        }
        return window.cache[key];*/
    return getGlobalData(key);

  } else {
    let storage = type == 'session' ? sessionStorage : localStorage;
    return JSON.parse(storage.getItem(key));
  }
};

const removeCacheData = (type, key) => {
  if (type !== 'window') {
    let storage = type === 'session' ? sessionStorage : localStorage;
    if (key instanceof Array) {
      for (let item of key) {
        storage.removeItem(item);
      }
    } else {
      return storage.removeItem(key);
    }


  } else {
    /* if (window.cache) {
       if (key instanceof Array) {
         for (let item of key) {
           delete window.cache[item];
           delete window.cache[item + ':ts'];
         }
       } else {
         delete window.cache[key];
         delete window.cache[key + ':ts'];
       }
     }*/
    if (key instanceof Array) {
      for (let item of key) {
        delete globalData[item];
        delete globalData[item + ':ts'];
      }
    } else {
      delete globalData[key];
      delete globalData[key + ':ts'];
    }
  }
};

export const removeCacheDataAndTime = (type, key) => {
  removeCacheData(type, key);
  removeCacheData(type, key + ':ts');
};

//返回storage数据
export const getCacheDataByExpire = (type, name, timeout) => {
  console.info('get', type, name, timeout);
  let cacheKey = name;
  let cacheTimeKey = name + ':ts';

  let cacheTime = getCacheData(type, cacheTimeKey);
  if (!cacheTime || cacheTime + timeout < Date.now()) {
    removeCacheDataAndTime(type, name);
    return null;
  }
  return getCacheData(type, cacheKey);
};

export const setCacheDataAndTime = (type, name, value) => {
  console.info('set', type, name, value);
  let cacheKey = name;
  let cacheTimeKey = name + ':ts';
  setCacheData(type, cacheKey, value);
  setCacheData(type, cacheTimeKey, Date.now());
};
