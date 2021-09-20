import React from "react"
import { XCircleIcon } from "@heroicons/react/solid"
import { Tab } from "../models/tab-model";



  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }
  
  type TabMenuProps = {
    tabs: Tab[],
    handleTabClick: (tabID: string) => void,
    handleTabClose: (tabID: string) => void,
  }


  export default function TabMenu(props: TabMenuProps) {

    const onTabClick = (tab: Tab) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      // buttons == 4 represente le click du milieu sur la souris
      (event.buttons == 3 && tab.id !== "0") ? props.handleTabClose(tab.id) : props.handleTabClick(tab.id)
    }

    const onTabClose = (tab: Tab) => {
      tab.id !== "0" && props.handleTabClose(tab.id)
    }

    return (
      <div className="pt-1.5 select-none shadow-sm bg-blueGray-900 dark:bg-black border-b dark:border-gray-800 border-blueGray-800">
        
        <nav className="flex pt-0.5 overflow-x-auto whitespace-nowrap w-screen custom-scrollbar px-2 pb-2" aria-label="Tabs">
          {props.tabs.map((tab, idx) => (
            <div
              onClick={onTabClick(tab)}
              key={tab.id}
              className={classNames(
                tab.current ? 
                  'bg-blueGray-700 dark:bg-gray-900 ring-2 ring-indigo-600 text-white scale:105' 
                  : 'text-gray-200 hover:text-white transform duration-200 scale-95 hover:scale-100 hover:bg-blueGray-600 dark:hover:bg-gray-700 bg-blueGray-700 dark:bg-gray-800',
                  `px-2 py-1
                  font-medium text-sm rounded-md group 
                  flex cursor-pointer focus:outline-none mx-0.5 `
              )}
              aria-current={tab.current ? 'page' : undefined}
            >
              {tab.name}
              {
                tab.closable &&
                <button onClickCapture={() => onTabClose(tab)} className="focus:outline-none hover:outline-none">
                  <XCircleIcon 
                    className={classNames(
                      tab.current ? 'text-white group-hover:text-red-400' : 'text-gray-200 group-hover:text-red-400 ',
                      'h-5 w-5 pl-1 focus:outline-none hover:outline-none'
                    )}
                    />
                </button>
              }
            </div>
          ))}
        </nav>
      </div>
    )
  }