import VodUploader from './vod-wx-sdk-v2.jsx'
//import {signature} from 'services/homework'
import Taro from "@tarojs/taro";
import {mainHost} from "../../services/config";
import {signature} from '../../services/homework'
// eslint-disable-next-line import/no-commonjs


let signatureStr;

function setSignature(callback) {
  if (signatureStr) {
    return callback(signatureStr)
  }
  signature().then(res => {
    signatureStr = res.data;
    callback(res.data)
  }).catch()
}

/**
 * 采用递归的方式多文件上传
 * data:arr:需要上传的文件列表
 * index:num：imgPaths开始上传的序号
 * successFiles:arr:已上传成功的文件
 */

export function uploadFiles(data, index, successFiles) {

  return new Promise((resolve, reject) => {
    VodUploader.start({
      mediaFile: data[index], //必填，把chooseVideo回调的参数(file)传进来
      getSignature: setSignature, //必填，获取签名的函数
      mediaName: data[index].thumbTempFilePath ? '作业视频' : '作业录音', //选填，视频名称，强烈推荐填写(如果不填，则默认为“来自微信小程序”)

      success: function (result) {

      },
      error: function (result) {
        console.log('error');
        console.log(result);
        Taro.showModal({
          title: '上传失败',
          content: JSON.stringify(result),
          showCancel: false
        });
        reject(result)
      },
      progress: function (result) {
      },
      finish: function (result) {
        successFiles.push(result);
        index++; //下一张
        if (index === data.length) {
          resolve(successFiles);
        } else {
          //递归调用，上传下一张
          uploadFiles(data, index, successFiles).then(r => resolve(r))
        }


      }
    })

  });


}


export function uploadImgs(imgPaths, index, successFiles) {

  return new Promise((resolve, reject) => {

    Taro.uploadFile({
      url: mainHost + '/api/student/homework/add/picture',
      filePath: imgPaths[index],
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data",
      },
      success: function (res) {

        if (res && res.data) {
          successFiles.push(res.data);
        }
        index++; //下一张
        if (index === imgPaths.length) {
          resolve(successFiles)
        } else {
          //递归调用，上传下一张
          uploadImgs(imgPaths, index, successFiles).then(r => resolve(r));
        }

      },
      fail: function (e) {

        reject(e)
      }
    })
  });

}


