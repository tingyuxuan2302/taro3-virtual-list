import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import VirtualList from '../../components/VirtualList'

import './index.scss'

export default function Demo(): JSX.Element {
  const [list, setList] = useState<number[]>([])
  const [pageNum, setPageNum] = useState(1)

  useEffect(() => {
    const arr: number[] = []
    Array(7).fill(0).forEach((item, index) => {
      arr.push(index)
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
  const renderFunc = (item, index, pageIndex) => {
    return (
      <View className="el">{`当前是第${item}个元素，是第${pageIndex}屏的数据`}</View>
    )
  }
  const handleBottom = () => {
    console.log('触底了')
  }
  const handleComplete = () => {
    console.log('加载完成')
  }
  const handleScrollToLower = () => {
    const arr: number[] = []
    Array(7).fill(0).forEach((item, index) => {
      arr.push(list.length + index)
    })
    let _list = [...list]
    _list = _list.concat(arr)
    setList(_list)
    setPageNum(pageNum + 1)
  }
  return (
    <View>
      <VirtualList
        list={list}
        pageNum={pageNum}
        segmentNum={7}
        onRender={renderFunc}
        onBottom={handleBottom}
        onComplete={handleComplete}
        listType="multi"
        scrollViewProps={{
          style: {
            "height": '100vh',
          },
          onScrollToLower: handleScrollToLower,
        }}
      />
    </View>
  )

}
