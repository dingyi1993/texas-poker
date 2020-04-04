export interface DoubleLink<T> {
  next: DoubleLink<T>;
  prev: DoubleLink<T>;
  data: T;
}

export const createDoubleLink = <T>(list: T[]): DoubleLink<T> => {
  if (list.length < 2) {
    throw new Error('双向链表长度必大于等于2');
  }
  let doubleLink: DoubleLink<T> | null = null;
  const lastNode = list.reduce<DoubleLink<T> | null>((prev: DoubleLink<T> | null, curr) => {
    // 这里 any 要想办法去掉
    const linkNode: any = { data: curr };
    if (!prev) {
      doubleLink = linkNode;
      return doubleLink;
    } else {
      prev.next = linkNode;
      linkNode.prev = prev;
      return linkNode;
    }
  }, doubleLink);
  if (!doubleLink || !lastNode) {
    throw new Error('创建双向链表失败');
  }
  lastNode.next = doubleLink;
  (doubleLink as DoubleLink<T>).prev = lastNode;
  return doubleLink;
};
