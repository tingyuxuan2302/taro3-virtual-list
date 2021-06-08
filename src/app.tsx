import { Component } from 'react'

class App extends Component {
  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    // eslint-disable-next-line react/prop-types
    return this.props.children
  }
}

export default App
