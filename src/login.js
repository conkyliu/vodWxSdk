import {binding, login} from "./services/my";
import Taro from "@tarojs/taro";


export function Login(userInfo) {
  return new Promise((resolve, reject) => {
    Taro.login({
      success(res) {

        if (res.code) {
          //发起网络请求
          login({code: res.code, userInfo: userInfo}).then(re => {
            Taro.setStorageSync('userInfo', re.data);
            Taro.setStorageSync('x-member-id', re.data.id);

            if (!re.data.phone) {
              /* Taro.redirectTo({
                 url: '/pages/bindPhone/index'
               })*/
            }


            if (re.data.tenantIds && re.data.tenantIds.length > 0) {
              if (!Taro.getStorageSync('x-tenant-id')) {
                Taro.setStorageSync('x-tenant-id', re.data.tenantIds[0]);
              }

            }
            setTimeout(binding().then((rr) => {
              console.log(rr);
              Taro.setStorageSync('x-member-id', rr.data.id);
              Taro.setStorageSync('x-tenant-id', this.$router.params.tenantId);
              //绑定成功清除本地storage
              Taro.removeStorageSync('studentCode');
              Taro.removeStorageSync('x-auth-token-org');
              Taro.setStorageSync('userInfo', rr.data);
            }), 2000);


            resolve(re)
          }).catch(e => {

            reject(e)
          })
        } else {
          console.log('登录失败！' + res.errMsg);
          reject(res)
        }
      }
    })
  });


}


