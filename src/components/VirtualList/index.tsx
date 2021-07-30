import React, { Component } from 'react'
import Taro, { createSelectorQuery, getSystemInfoSync } from '@tarojs/taro'
import { View, ScrollView, Block } from '@tarojs/components'
import PropTypes, { InferProps } from 'prop-types'
import { VirtualListProps, VirtualListState } from "../../../@types/virtualList"
import { throttle, isH5 } from '../../common/utils'

/**
 * 虚拟列表
 * @param	{Array}	list  列表数据
 * @param	{String}	listId  虚拟列表唯一id（防止同一个页面有多个虚拟列表导致渲染错乱）
 * @param	{Number}	segmentNum  自定义分段的数量，默认10
 * @param	{Boolean}	autoScrollTop  组件内部是否需要根据list数据变化自动滚动至列表顶部
 * @param	{Number}	screenNum  指定页面显示区域基准值，例如2，则组件会监听 2 * scrollHeight高度的上下区域(该值会影响页面真实节点的渲染数量)
 * @param	{Object}	scrollViewProps  scrollView的参数
 * @param	{Function}	onBottom  二维列表是否已经触底回调
 * @param	{Function}	onComplete  二维列表是否已经把全部数据加载完成的回调
 * @param	{Function}	onRender  二维列表Item的渲染回调
 * @param	{Function}	onRenderTop  二维列表上部分内容渲染回调
 * @param	{Function}	onRenderBottom  二维列表下部分内容渲染回调
 * @param	{Function}	onGetScrollData  获取滚动信息
 */
export default class VirtialList extends Component<VirtualListProps, VirtualListState> {
  public static propTypes: InferProps<VirtualListProps>
  public static defaultProps: VirtualListProps

  constructor(props: VirtualListProps) {
    super(props)
    this.state = {
      wholePageIndex: 0, // 每一屏为一个单位，屏幕索引
      twoList: [], // 二维数组
      isComplete: false, // 数据是否全部加载完成
      innerScrollTop: 0, // 记录组件内部的滚动高度
    } as VirtualListState
  }

  componentDidMount(): void {
    const { list, listType } = this.props
    this.getSystemInformation()
    if (listType === "single") {
      this.formatList(list)
    } else if (listType === "multi") {
      this.formatMultiList(list)
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps: VirtualListProps): void {
    const { list, listType } = this.props
    if (listType === "single") {
      // 提前把innerScrollTop置为不是0，防止列表置顶失效
      this.setState({
        innerScrollTop: 1,
      })

      if (JSON.stringify(nextProps.list) !== JSON.stringify(list)) {
        this.pageHeightArr = []
        this.setState({
          wholePageIndex: 0,
          isComplete: false,
          twoList: [],
          innerScrollTop: 0,
        }, () => {
          if (nextProps.list?.length) {
            this.formatList(nextProps.list)
          } else {
            this.handleComplete()
          }
        })
      }
    } else if (listType === "multi") {
      if (JSON.stringify(nextProps.list) !== JSON.stringify(list)) {
        this.formatMultiList(nextProps.list, nextProps.pageNum)
      }
    }
    if (!nextProps.list?.length) {
      // list为空
      this.handleComplete()
    }
  }
  private pageHeightArr: number[] = [] // 用来装每一屏的高度
  private initList: any[] = [] // 承载初始化的二维数组
  private windowHeight = 0 // 当前屏幕的高度
  private currentPage: any = Taro.getCurrentInstance()
  private observer: IntersectionObserver

  getSystemInformation = ():void => {
    try {
      const res = getSystemInfoSync()
      this.windowHeight = res.windowHeight
    } catch (err) {
      console.error(`获取系统信息失败：${err}`)
    }
  }
  /**
   * 列表数据渲染完成
   */
  handleComplete = ():void => {
    const { onComplete } = this.props
    this.setState({
      isComplete: true,
    }, () => {
      onComplete?.()
    })
  }
  /**
   * 当list是通过服务端分页获取的时候，对list进行处理
   * @param	list 外部list
   * @param	pageNum 当前页码
   */
  formatMultiList(list: any[] = [], pageNum = 1): void {
    const { twoList} = this.state
    if (!list?.length) return
    this.segmentList(list)
    twoList[pageNum - 1] = this.initList[pageNum - 1]
    this.setState({
      twoList: [...twoList],
      wholePageIndex: pageNum - 1,
    }, () => {
      Taro.nextTick(() => {
        this.setHeight()
      })
    })
  }
  /**
   * 按规则分割list，存在私有变量initList，备用
   */
  segmentList(list: any[] = []): void {
    const { segmentNum } = this.props
    let arr: any[] = []
    const _list: any[] = []
    list.forEach((item, index) => {
      arr.push(item)
      if ((index + 1) % segmentNum === 0) {
        _list.push(arr)
        arr = []
      }
    })
    // 将分段不足segmentNum的剩余数据装入_list
    const restList = list.slice(_list.length * segmentNum)
    if (restList?.length) {
      _list.push(restList)
      if (_list.length <= 1) {
        // 如果数据量少，不足一个segmentNum，则触发完成回调
        this.handleComplete()
      }
    }
    this.initList = _list
  }
  /**
   * 将列表格式化为二维
   * @param	list 	列表
   */
  formatList(list: any[] = []): void {
    this.segmentList(list)
    this.setState({
      twoList: this.initList.slice(0, 1),
    }, () => {
      Taro.nextTick(() => {
        this.setHeight(list)
      })
    })
  }
  renderNext = (): void => {
    const { onBottom, listType, scrollViewProps, list } = this.props
    if (listType === "single") {
      const page_index = this.state.wholePageIndex + 1
      if (!this.initList[page_index]?.length) {
        this.handleComplete()

        return
      }
      onBottom?.()

      this.setState({
        wholePageIndex: page_index,
      }, () => {
        const { wholePageIndex, twoList } = this.state
        twoList[wholePageIndex] = this.initList[wholePageIndex]
        this.setState({
          twoList: [...twoList],
        }, () => {
          Taro.nextTick(() => {
            this.setHeight(list)
          })
        })
      })
    } else if (listType === "multi") {
      scrollViewProps?.onScrollToLower?.()
    }
  }
  /**
   * 设置每一个维度的数据渲染完成之后所占的高度
   */
  setHeight(list: any[] = []):void {
    const { wholePageIndex } = this.state
    const { listId } = this.props
    const query = createSelectorQuery()
    query.select(`#${listId} .wrap_${wholePageIndex}`).boundingClientRect()
    query.exec((res) => {
      // 有数据的时候才去收集高度，不然页面初始化渲染（在H5中无数据）收集到的高度是错误的
      if (list?.length) {
        this.pageHeightArr.push(res?.[0]?.height)
      }
    })
    this.handleObserve()
  }
  webObserve = (): void => {
    const { listId } = this.props
    const $targets = document.querySelectorAll(`#${listId} .zt-main-list>taro-view-core`)
    const options = {
      root: document.querySelector(`#${listId}`),
      rootMargin: "500px 0px",
      // threshold: [0.5],
    }
    this.observer = new IntersectionObserver(this.observerCallBack, options)
    $targets.forEach($item => {
      this.observer?.observe($item)
    })
  }
  observerCallBack = (entries: IntersectionObserverEntry[]): void => {
    const { twoList } = this.state
    entries.forEach((item ) => {
      const screenIndex = item.target['data-index']
      if (item.isIntersecting) {
        // 如果有相交区域，则将对应的维度进行赋值
        twoList[screenIndex] = this.initList[screenIndex]
        this.setState({
          twoList: [...twoList],
        })
      } else {
        // 当没有与当前视口有相交区域，则将改屏的数据置为该屏的高度占位
        twoList[screenIndex] = { height: this.pageHeightArr[screenIndex] }
        this.setState({
          twoList: [...twoList],
        })
      }
    })
  }
  /**
   * 监听可视区域
   */
  handleObserve = (): void => {
    if (isH5) {
      this.webObserve()
    } else {
      this.miniObserve()
    }
  }
  /**
   * 小程序平台监听
   */
  miniObserve = (): void => {
    const { wholePageIndex } = this.state
    const { scrollViewProps, listId, screenNum } = this.props
    // 以传入的scrollView的高度为相交区域的参考边界，若没传，则默认使用屏幕高度
    const scrollHeight = scrollViewProps?.style?.height || this.windowHeight
    const observer = Taro.createIntersectionObserver(this.currentPage.page).relativeToViewport({
      top: screenNum * scrollHeight,
      bottom: screenNum * scrollHeight,
    })
    observer.observe(`#${listId} .wrap_${wholePageIndex}`, (res) => {
      const { twoList } = this.state
      if (res?.intersectionRatio <= 0) {
        // 当没有与当前视口有相交区域，则将改屏的数据置为该屏的高度占位
        twoList[wholePageIndex] = { height: this.pageHeightArr[wholePageIndex] }
        this.setState({
          twoList: [...twoList],
        })
      } else if (!twoList[wholePageIndex]?.length) {
        // 如果有相交区域，则将对应的维度进行赋值
        twoList[wholePageIndex] = this.initList[wholePageIndex]
        this.setState({
          twoList: [...twoList],
        })
      }
    })
  }

  handleScroll = throttle((event: any): void => {
    const { listId } = this.props
    this.props.onGetScrollData?.({
      [`${listId}`]: event,
    })
    this.props.scrollViewProps?.onScroll?.(event)
  }, 300, 300)

  render(): JSX.Element {
    const {
      twoList,
      isComplete,
      innerScrollTop,
    } = this.state
    const {
      segmentNum,
      scrollViewProps,
      onRenderTop,
      onRenderBottom,
      onRender,
      listId,
      className,
      autoScrollTop,
    } = this.props

    const scrollStyle = {
      height: '100%',
    }

    const _scrollViewProps = {
      ...scrollViewProps,
      scrollTop: autoScrollTop ? (innerScrollTop === 0 ? 0 : "") : scrollViewProps?.scrollTop,
    }

    return (
      <ScrollView
        scrollY
        id={listId}
        style={scrollStyle}
        onScrollToLower={this.renderNext}
        lowerThreshold={250}
        className={`zt-virtual-list-container ${className}`}
        {..._scrollViewProps}
        onScroll={this.handleScroll}
      >
        {onRenderTop?.()}
        <View className="zt-main-list">
          {
            twoList?.map((item, pageIndex) => {
              return (
                <View key={pageIndex} data-index={pageIndex} className={`wrap_${pageIndex}`}>
                  {
                    item?.length > 0 ? (
                      <Block>
                        {
                          item.map((el, index) => {
                            return onRender?.(el, (pageIndex * segmentNum + index), pageIndex)
                          })
                        }
                      </Block>
                    ) : (
                      <View style={{'height': `${item?.height}px`}}></View>
                    )
                  }
                </View>
              )
            })
          }
        </View>
        {isComplete && onRenderBottom?.()}
      </ScrollView>
    )
  }
}

VirtialList.defaultProps = {
  list: [],
  pageNum: 1,
  listId: "zt-virtial-list",
  listType: 'single',
  segmentNum: 10,
  screenNum: 2,
  scrollViewProps: {},
  className: "",
  autoScrollTop: true,
  onRender: function render() {
    return (<View />)
  },
}

VirtialList.propTypes = {
  list: PropTypes.array.isRequired,
  listId: PropTypes.string,
  listType: PropTypes.string,
  segmentNum: PropTypes.number,
  screenNum: PropTypes.number,
  autoScrollTop: PropTypes.bool,
  scrollViewProps: PropTypes.object,
  onRender: PropTypes.func.isRequired,
  onBottom: PropTypes.func,
  onComplete: PropTypes.func,
  onRenderTop: PropTypes.func,
  onRenderBottom: PropTypes.func,
  onGetScrollData: PropTypes.func,
}
