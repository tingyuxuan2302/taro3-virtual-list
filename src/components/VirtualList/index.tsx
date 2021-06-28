import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Block } from '@tarojs/components'
import PropTypes, { InferProps } from 'prop-types'
import { VirtualListProps, VirtualListState } from "../../../@types/VirtualList"

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
 */
export default class VirtialList extends Component<VirtualListProps, VirtualListState> {
  public static propTypes: InferProps<VirtualListProps>
  public static defaultProps: VirtualListProps

  constructor(props: VirtualListProps) {
    super(props)
    this.state = {
      wholePageIndex: 0, // 每一屏为一个单位，屏幕索引
      twoList: [], // 二维数组
      isScrollTop: false, // 是否需要滚动到顶部
      isComplete: false, // 数据是否全部加载完成
    } as VirtualListState
  }

  componentDidMount(): void {
    const { list } = this.props
    this.formatList(list)
    Taro.getSystemInfo()
      .then(res => {
        this.windowHeight = res?.windowHeight
      })
  }
  UNSAFE_componentWillReceiveProps(nextProps: VirtualListProps): void {
    const { list } = this.props
    if (JSON.stringify(nextProps.list) !== JSON.stringify(list)) {
      this.pageHeightArr = []
      this.setState({
        wholePageIndex: 0,
        isScrollTop: false,
        isComplete: false,
        twoList: [],
      }, () => {
        this.formatList(nextProps.list, true)
      })
    }
  }
  private pageHeightArr: number[] = [] // 用来装每一屏的高度
  private initList: any[] = [] // 承载初始化的二维数组
  private windowHeight = 0 // 当前屏幕的高度
  private currentPage: any = Taro.getCurrentInstance()
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
   * 将列表格式化为二维
   * @param	list 	列表
   * @param	isReRender 	当列表数据发生变化，将scrollView滑动至顶部
   */
  formatList(list: [], isReRender = false): void {
    const { segmentNum } = this.props
    if (!list || !list.length) {
      // 初始化没有数据
      return
    }
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
    if (!_list.length) {
      // 没数据
      this.handleComplete()
      return
    }
    this.initList = _list
    this.setState({
      twoList: _list.slice(0, 1),
    }, () => {
      if (isReRender) {
        this.setState({
          isScrollTop: true,
        })
      }
      Taro.nextTick(() => {
        this.setHeight()
      })
    })
  }
  renderNext = (): void => {
    const { onBottom } = this.props
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
          this.setHeight()
        })
      })
    })
  }
  /**
   * 设置每一个维度的数据渲染完成之后所占的高度
   */
  setHeight():void {
    const { wholePageIndex } = this.state
    const { listId } = this.props
    const query = Taro.createSelectorQuery()
    query.select(`#${listId} .wrap_${wholePageIndex}`).boundingClientRect()
    query.exec((res) => {
      this.pageHeightArr.push(res?.[0]?.height)
    })
    this.observe()
  }
  /**
   * 监听可视区域
   */
  observe = (): void => {
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

  render(): JSX.Element {
    const {
      twoList,
      isScrollTop,
      isComplete,
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

    return (
      <ScrollView
        scrollY
        id={listId}
        scrollTop={autoScrollTop && isScrollTop ? 0 : ''}
        style={scrollStyle}
        onScrollToLower={this.renderNext}
        lowerThreshold={250}
        className={`zt-virtual-list-container ${className}`}
        {...scrollViewProps}
      >
        {onRenderTop?.()}
        <View className="zt-main-list">
          {
            twoList?.map((item, pageIndex) => {
              return (
                <View key={pageIndex} className={`wrap_${pageIndex}`}>
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
  listId: "zt-virtial-list",
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
  segmentNum: PropTypes.number,
  screenNum: PropTypes.number,
  autoScrollTop: PropTypes.bool,
  scrollViewProps: PropTypes.object,
  onRender: PropTypes.func.isRequired,
  onBottom: PropTypes.func,
  onComplete: PropTypes.func,
  onRenderTop: PropTypes.func,
  onRenderBottom: PropTypes.func,
}
