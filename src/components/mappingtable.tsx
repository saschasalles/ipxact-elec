import contextMenu from "electron-context-menu";
import React, { useState, useEffect, useRef } from "react"
import { MappingTableRowData } from "../models/mapping-row-model";
import { MappingTableRow } from "./mappingtable-row";


type MappingTableProps = {
    mappingData: MappingTableRowData[],
    onRowClick: (register: MappingTableRowData) => void,
    onRowSelected: (register: MappingTableRowData) => void,
    onSelectAllClick: (selectAll: boolean) => void,
    onRowRightClick: (register: MappingTableRowData, pos: number[]) => void,
    selection: boolean,
    mode: string,
  }
  
  export default function MappingTable(props: MappingTableProps) {
    const [selectAll, setSelectAll] = useState(false)
    const [dataToDisplay, setDataToDisplay] = useState(props.mappingData)
    const [fixed, setFixed] = useState(false)
    const containerRef = useRef(null);

    const onSelectAllClick: React.MouseEventHandler<HTMLTableHeaderCellElement> = (event) => {
      setSelectAll(!selectAll)
      props.onSelectAllClick(selectAll) 
    }

    const onRowRightClick = (register: MappingTableRowData, pos: number[]) => {
      console.log(register, pos)
    }

    const filteredData = (mode: string) => {
      switch (mode) {
        case "DEFAULT":
          setDataToDisplay(props.mappingData);
          break;
        case "REGS_ONLY":
          setDataToDisplay(props.mappingData.filter(data => data.blockId === null && data.registerId !== null))
          break;
        case "BKS_ONLY":
          setDataToDisplay(props.mappingData.filter(data => data.registerId === null && data.blockId !== null))
          break;

        default:
          setDataToDisplay(props.mappingData);
          break;
      }
    }

    useEffect(() => {
      filteredData(props.mode)
    }, [props.mode, props.mappingData])



    return (
    <div className="flex flex-col py-2">
        <div className="-my-2 sm:-mx-6 lg:-mx-8 pt-2 mb-2">
          <div className="py-2 align-middle sm:px-6 lg:px-8 ">
            
            <div className={`overflow-x-auto h-full h-75 mx-4 mt-2 top-0 bg-blueGray-700 dark:bg-black rounded-xl`} >
              <table className="table-auto w-full">
                <thead>
                  <tr className="bg-blueGray-600 w-full rounded-xl">
                    {props.selection &&
                    <th
                      onClick={onSelectAllClick}
                      scope="col"
                      className="bg-blueGray-600 dark:bg-gray-900 hover:text-red-300 shadow-md select-none text-white w-min px-2 py-3 text-center text-sm font-medium tracking-tight sticky top-0 rounded-tl-xl cursor-pointer"
                    >
                      Selected
                    </th>
                    }
                    <th
                      scope="col"
                      className={`bg-blueGray-600 dark:bg-gray-900 shadow-md px-6 py-3 text-left select-none text-sm font-medium text-white tracking-tight sticky top-0 ${!props.selection && "rounded-tl-xl"}`}
                    >
                      Function
                    </th>
                    <th
                      scope="col"
                      className="bg-blueGray-600 dark:bg-gray-900 shadow-md px-6 py-3 text-left select-none text-sm font-medium text-white tracking-tight sticky top-0 "
                    >
                      Base Address
                    </th>
                    <th
                      scope="col"
                      className="bg-blueGray-600 dark:bg-gray-900 shadow-md px-6 py-3 text-left select-none text-sm font-medium  text-white tracking-tight sticky top-0"
                    >
                      Local Address
                    </th>
                    <th
                      scope="col"
                      className="bg-blueGray-600 dark:bg-gray-900 shadow-md px-6 py-3 text-left select-none text-sm font-medium text-white tracking-tight sticky top-0"
                    >
                      <span>Register</span> - <span className="text-sky-300">Block</span>
                    </th>
                    <th
                      scope="col"
                      className="bg-blueGray-600 dark:bg-gray-900 shadow-md px-6 w-2/5 py-3 select-none text-left text-sm font-medium text-white tracking-tight sticky top-0 rounded-tr-xl"
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                
                <tbody className={`bg-blueGray-600 dark:bg-gray-800 max-h-full h-full overflow-y-scroll divide-y divide-blueGray-500 dark:divide-gray-600`}>
                  {dataToDisplay.map((rowData, idx) => (
                    <MappingTableRow 
                      key={idx}
                      rowData={rowData} 
                      onRowClick={props.onRowClick} 
                      onRowSelected={props.onRowSelected}
                      onRowRightClick={props.onRowRightClick}
                      rounded={idx + 1 == dataToDisplay.length ? true : false} 
                      selection={props.selection} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
  