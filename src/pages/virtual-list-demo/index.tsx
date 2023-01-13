import React, { useState, useEffect, Fragment } from 'react'
import { View, Button } from '@tarojs/components'
import ZtVirtualList from '../../components/VirtualList'

import './index.scss'

interface Item {
  index: number
  number: number
}

export default function Demo(): JSX.Element {
  const [list, setList] = useState<Item[]>([])
  const [pageNum, setPageNum] = useState(1)

  useEffect(() => {
    const arr: Item[] = []
    Array(10).fill(0).forEach((item, index) => {
      arr.push({
        index,
        number: 0,
      })
    })
    setList(arr)
  }, [])
  // onReachBottom() {
  //   console.log('触底了----')
  //   // this.renderNext()
  //   this.setState({
  //     isBottom: true,
  //   })
  // }
  // getIsBottomStatus = (status) => {
  //   this.setState({
  //     isBottom: status,
  //   })
  // }
  const add = (index) => {
    const _list = [...list]
    _list[index]['index']++
    setList(_list)
  }
  const renderFunc = (item, index, pageIndex) => {
    return (
      <View className="el" key={pageIndex + 10}>{`当前是第${item.index}个元素，是第${pageIndex}屏的数据`}
        <Button onClick={() => add(index)}>+</Button>
      </View>
    )
  }
  // const handleBottom = () => {
  //   console.log('触底了')
  // }
  const handleComplete = () => {
    console.log('加载完成')
  }
  // const handleGetScrollData = (e) => {
  //   console.log('scroll-data', e)
  // }
  const handleScrollToLower = () => {
    const arr: Item[] = []
    Array(10).fill(0).forEach((item, index) => {
      arr.push({
        index: list.length + index,
        number: 0,
      })
    })
    let _list = [...list]
    _list = _list.concat(arr)
    setTimeout(() => {
      setList(_list)
    }, 1000)
    setPageNum(pageNum + 1)
  }
  const handleRenderLoad = () => {
    return '数据载入中...'
  }
  const handleRenderTop = () => {
    return (<Fragment>
      <View>sjdlfjslf</View>
      <View>sjdlfjslf</View>
      <View>sjdlfjslf</View>
      <View>sjdlfjslf</View>
      <View>sjdlfjslf</View>
      <View className="sticky-box">我是吸顶元素</View>
    </Fragment>)
  }
  return (
    <View>
      <ZtVirtualList
        list={list}
        pageNum={pageNum}
        segmentNum={10}
        onRender={renderFunc}
        onRenderTop={handleRenderTop}
        // onBottom={handleBottom}
        onComplete={handleComplete}
        // onGetScrollData={handleGetScrollData}
        listType="multi"
        onRenderLoad={handleRenderLoad}
        scrollViewProps={{
          style: {
            "height": '100vh',
          },
          lowerThreshold: 30,
          onScrollToLower: handleScrollToLower,
        }}
      />
    </View>
  )

}
