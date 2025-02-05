import cx from 'classnames';
import { Fragment } from 'react';
import { TableHeaderItem } from './TableHeaderItem';
interface ITableHeader {
  gridType: string;
  titles: string[];
  positions: string[];
}

export function TableHeader({ gridType, titles, positions }: ITableHeader) {
  function Items() {
    return (
      <Fragment>
        {titles.map((title, index) => (
          <TableHeaderItem
            key={title}
            itemTitle={title}
            position={positions[index]}
          />
        ))}
      </Fragment>
    );
  }
  return (
    <div className={cx('grid mt-4', gridType)}>
      <Items />
    </div>
  );
}
