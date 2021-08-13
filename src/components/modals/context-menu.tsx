import React, { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';

// type ContextMenuProps = {
//   x: number;
//   y: number;
//   visible: boolean;
// };

// const ContextMenu = (props: ContextMenuProps) => {
//   useEffect(() => {
//     setVisible(props.visible);
//   }, [props.visible]);

//   const [visible, setVisible] = useState(false);

//   return (
//     <>
//       {visible && (
//         <ul
//           style={{ top: props.y, left: props.x }}
//           className={` ${
//             visible ? 'visible block' : 'invisible hidden'
//           } absolute backdrop-filter backdrop-opacity-100 backdrop-blur-md backdrop-contrast-100 backdrop-brightness-50 rounded-lg text-sm text-white px-1.5 py-1.5`}
//         >
//           <li className="hover:bg-blue-600 rounded-md px-2.5 py-0.5 text-left select-none">Open Register</li>
//           <li className="hover:bg-blue-600 rounded-md px-2.5 py-0.5 text-left select-none">Edit Register</li>
//           <li className="hover:bg-blue-600 rounded-md px-2.5 py-0.5 text-left select-none">Delete Register</li>
//           <li className="hover:bg-blue-600 rounded-md px-2.5 py-0.5 text-left select-none">Duplicate Register</li>
//         </ul>
//       )}
//     </>
//   );
// };

// export default ContextMenu;

// const ContextMenu = ({ parentRef, items: ContextMenuItem) => {
//   const [isVisible, setVisibility ] = useState(false);
//   const [x, setX] = useState(0);
//   const [y, setY] = useState(0);

//   useEffect(() => {
//       const parent = parentRef.current;
//       if (!parent) {
//           return;
//       }

//       const showMenu = (event) => {
//           event.preventDefault();

//           setVisibility(true);
//           setX(event.clientX);
//           setY(event.clientY);
//       };

//       const closeMenu = () => {
//           setVisibility(false);
//       };

//       parent.addEventListener('contextmenu', showMenu);
//       window.addEventListener('click', closeMenu);

//       return function cleanup() {
//           parent.removeEventListener('contextmenu', showMenu);
//           window.removeEventListener('click', closeMenu);
//       };
//   });

//   const style = {
//       top: y,
//       left: x,
//   };

//   return isVisible ?  (
//       <div className='context-menu' style={style}>
//           {items.map((item, index) => {
//               return (
//                   <div
//                       key={index}
//                       onClick={item.onClick}
//                       className='context-menu__item'
//                   >
//                       {item.text}
//                   </div>
//               );
//           })}
//       </div>
//   ) : null;
// };

// export default ContextMenu;