var mainHost, secondaryHost;


if (__wxConfig.accountInfo.appId === 'wx6f8bb0690e45d6ca') {
  mainHost = 'https://org.chengyisi.com';
  secondaryHost = 'https://console.chengyisi.com';
} else {
  mainHost = 'https://saas.jian1024.com';
  secondaryHost = 'https://console.jian1024.com';
}
export {mainHost, secondaryHost}
console.log(__wxConfig, 'envVersion');
