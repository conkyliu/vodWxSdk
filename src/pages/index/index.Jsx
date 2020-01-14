import Taro, {Component,} from '@tarojs/taro'
import {Button, Video, View} from '@tarojs/components'
import './index.less'
import {uploadFiles} from './uploadFile'


export default class Index extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config = {
    navigationBarTitleText: '首页'
  };

  state = {
    selectedVideos: []
  };

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }


  onSelect = () => {
    const self = this;
    let {selectedVideos} = this.state;
    Taro.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: true,
      maxDuration: 60,
      success: function (res) {
        selectedVideos.push(res);
        self.setState({
          selectedVideos: selectedVideos
        });
      }
    }).then(res => console.log(res))
  };
  onSubmit = () => {
    console.log('onSubmit');
    uploadFiles(this.state.selectedVideos, 0, []).then(res => {
      console.log(res)
    })
  };


  render() {
    return (
      <View className='index'>
        <Button onClick={this.onSelect}>选择视频</Button>
        {this.state.selectedVideos.length && <Video src={this.state.selectedVideos[0].tempFilePath}/>}
        <Button onClick={this.onSubmit}>上传</Button>
      </View>
    )
  }
}
