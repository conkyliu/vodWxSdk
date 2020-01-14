import Taro, {Component} from '@tarojs/taro'
import './app.less'
import {View} from "@tarojs/components";
import {binding} from './services/my'
import {Login} from "./login";

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5') {
//   require('nerv-devtools')
// }


class App extends Component {

  config = {
    pages: [
      'pages/index/index',

    ],

    window: {
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#1da57a',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'white'
    },

  };

  state = {};

  componentWillMount() {
    Login()

  }

  componentDidMount() {

  }


  componentDidShow() {

  }

  componentDidHide() {
  }

  componentDidCatchError() {
  }

  componentDidNotFound(obj) {
    console.log(obj, 'componentDidNotFound')
  }

// 在 App 类中的 render() 函数没有实际作用
// 请勿修改此函数
  render() {

    return (
      <View>

      </View>
    )
  }
}

Taro.render(<App/>, document.getElementById('app'));
