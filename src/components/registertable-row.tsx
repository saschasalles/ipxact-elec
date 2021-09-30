import React from 'react';
import { RegisterTableRowData } from '../models/register-row-model';
import { CheckCircleIcon } from "@heroicons/react/solid"

type RegisterTableRowProps = {
  rowData: RegisterTableRowData;
  onRowClick: (row: RegisterTableRowData) => void;
  onRowSelected: (row: RegisterTableRowData) => void;
  rounded: boolean;
  selection: boolean;
};

export const RegisterTableRow = (props: RegisterTableRowProps) => {
  const onRowClick: React.MouseEventHandler<HTMLTableRowElement> = (event) => {
    props.onRowClick(props.rowData);
  };

  const onRowSelected: React.MouseEventHandler<HTMLTableRowElement> = (event) => {
    props.onRowSelected(props.rowData);
  };

  return (
    <tr
      key={props.rowData.id}
      onClick={onRowSelected}
      onDoubleClick={onRowClick}
      className={`${
        props.selection ? 'hover:bg-red-400' : 'hover:bg-blueGray-500 dark:hover:bg-gray-700'
      } duration-150 group cursor-pointer select-none`}
    >
      {props.selection && (
        <td
          className={`${
            props.rounded && 'rounded-bl-xl'
          } text-center px-6 py-4 whitespace-nowrap text-sm font-medium text-white`}
        >
          {props.rowData.selected && (
            <CheckCircleIcon className="md:ml-2 lg:ml-3 xl:ml-4 ml-2 h-5 w-5 text-red-400 group-hover:text-white " />
          )}
        </td>
      )}
      <td className={`${!props.selection && props.rounded && "rounded-bl-xl"} px-6 py-4 whitespace-nowrap text-sm text-white`}>{props.rowData.databit}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">{props.rowData.fieldName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{props.rowData.size}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
        0x{
        props
        .rowData
        .defaultValue
        .toString(16)
        .toUpperCase()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{props.rowData.access}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{props.rowData.description}</td>
      <td className={`${props.rounded && 'rounded-br-xl'} px-6 py-4 text-sm font-medium text-white whitespace-pre`}>
        {props.rowData.enumeratedValues}
      </td>
    </tr>
  );
};
