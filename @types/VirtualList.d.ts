import { ComponentClass } from 'react'
import { BaseComponent } from './baseType'

type ListType = "single" | "multi"
export interface VirtualListProps extends BaseComponent {
  /**
   * 列表数据
   */
  list: Array;
  /**
   * 虚拟列表唯一id（防止同一个页面有多个虚拟列表导致渲染错乱）
   */
  listId?: string;
  /**
   * 传入组件内的list类型
   * @param	single 一次性传入列表所有数据
   * @param	multi 从服务端分页请求，合并之后传入组件
   */
  listType: ListType;
  /**
   * 自定义分段的数量，默认10
   */
  segmentNum: number;
  /**
   * 当前页码，当list是通过服务端分页获取的时候必传
   */
  pageNum?: number;
  /**
   * 组件内部是否需要根据list数据变化自动滚动至列表顶部
   */
  autoScrollTop: boolean;
  /**
   * 指定页面显示区域基准值，例如2，则组件会监听 2 * scrollHeight高度的上下区域(该值会影响页面真实节点的渲染数量)
   */
  screenNum: number;
  /**
   * 自定义scrollView的参数，会合并到组件内部的scrollView的参数里
   */
  scrollViewProps?: any;
  /**
   * 列表的渲染回调，用于自定义列表Item
   * @param item 列表的单个数据项的值
   * @param index 列表的单个数据项的index
   * @param mainIndex 二维数组index
   */
  // eslint-disable-next-line no-unused-vars
  onRender(item: any, index: number, mainIndex: number): JSX.Element;
  /**
   * 列表是否已经触底
   */
  onBottom?(): void;
  /**
   * 列表是否已经把全部数据加载完成
   */
  onComplete?(): void;
  /**
   * 列表上部分内容渲染回调，用于渲染插入虚拟列表上边的内容
   */
  onRenderTop?(): any;
  /**
   * 列表下部分内容渲染回调，用于渲染插入虚拟列表下边的内容
   */
  onRenderBottom?(): any;
  /**
   * 获取滚动信息
   */
  // eslint-disable-next-line no-unused-vars
  onGetScrollData?(event: any): void;
  /**
   * 渲染loading内容
   */
  onRenderLoad?(): any;
}

export interface VirtualListState {
  /**
   * 每一个维度为一个单位，维度索引
   */
  wholePageIndex: number;
  /**
   * 二维数组
   */
  twoList: Array;
  /**
   * 数据是否全部加载完成
   */
  isComplete: boolean;
  /**
   * 记录组件内部的滚动高度
   */
  innerScrollTop: number;
}

declare const VirtualList: ComponentClass<VirtualListProps>

export default VirtualList
