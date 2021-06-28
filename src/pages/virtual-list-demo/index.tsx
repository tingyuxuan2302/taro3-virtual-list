import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import VirtualList from '../../components/VirtualList'

import './index.scss'

export default function Demo(): JSX.Element {
  const [list, setList] = useState<number[]>([])

  useEffect(() => {
    const arr: number[] = []
    Array(34).fill(0).forEach((item, index) => {
      arr.push(index)
    })
    setList(arr)
  }, [])
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
    Taro.showToast({
      title: "到底啦～",
    })
  }
  const renderBottom = () => {
    return (
      <View>我是底部内容！！！！</View>
    )
  }
  return (
    <View>
      <VirtualList
        list={list}
        onRender={renderFunc}
        onBottom={handleBottom}
        onComplete={handleComplete}
        onRenderBottom={renderBottom}
        scrollViewProps={{
          style: {
            "height": '100vh',
          },
        }}
      />
    </View>
  )

}
