import React, { useState } from 'react';
import { MappingTableRowData } from '../models/mapping-row-model';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { Menu } from '@headlessui/react';

type MappingTableRowProps = {
  rowData: MappingTableRowData;
  onRowClick: (register: MappingTableRowData) => void;
  onRowSelected: (register: MappingTableRowData) => void;
  onRowRightClick: (register: MappingTableRowData, pos: number[]) => void;
  rounded: boolean;
  selection: boolean;
};

export const MappingTableRow = (props: MappingTableRowProps) => {
  const [pos, setPos] = useState([]);

  const onRowDoubleClick: React.MouseEventHandler<HTMLTableRowElement> = (event) => {
    props.onRowClick(props.rowData);
  };

  const onRowSelected: React.MouseEventHandler<HTMLTableRowElement> = (event) => {
    props.onRowSelected(props.rowData);
  };

  const onRowRightClick: React.MouseEventHandler<HTMLTableRowElement> = (event) => {
    props.onRowRightClick(props.rowData, [event.clientX, event.clientY]);
  };

  return (
    <tr
      key={props.rowData.id}
      onClick={onRowSelected}
      onContextMenu={onRowRightClick}
      onDoubleClick={onRowDoubleClick}
      className={`${
        props.selection ? 'hover:bg-red-400' : 'hover:bg-blueGray-500 dark:hover:bg-gray-700'
      } duration-150 group cursor-pointer select-none ring-inset shadow-sm`}
    >
      {props.selection && (
        <td
          className={`${
            props.rounded && 'rounded-bl-xl'
          } text-center px-6 py-4 whitespace-nowrap text-sm font-medium text-white border-r border-blueGray-500 dark:border-gray-600`}
        >
          {props.rowData.selected && (
            <CheckCircleIcon className="md:ml-2 lg:ml-3 xl:ml-4 ml-2 h-5 w-5 text-red-400 group-hover:text-white " />
          )}
        </td>
      )}
      <td
        className={`${
          !props.selection && props.rounded && 'rounded-bl-xl'
        } px-6 py-4 whitespace-nowrap text-sm font-semibold text-white border-r border-blueGray-500 dark:border-gray-600`}
      >
        {props.rowData.functionName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100 border-r border-blueGray-500 dark:border-gray-600">
        {'0x' + props.rowData.baseAddress.toString(16)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100 border-r border-blueGray-500 dark:border-gray-600">
        {props.rowData.localAddress !== null && '0x' + props.rowData.localAddress.toString(16)}
      </td>
      <td
        className={`${
          props.rowData.registerId ? 'text-gray-100' : 'text-sky-300'
        } px-6 py-4 whitespace-nowrap font-semibold text-sm border-r border-blueGray-500 dark:border-gray-600`}
      >
        {props.rowData.registerId ? props.rowData?.registerName : props.rowData?.blockName}
      </td>
      <td className={`${props.rounded && 'rounded-br-xl'} px-6 py-4 whitespace-nowrap text-sm text-gray-100`}>
        {props.rowData?.description}
      </td>
    </tr>
  );
};
