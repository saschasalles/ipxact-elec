import React, { useEffect, useState, useCallback } from 'react';
import { RegisterTableRowData } from '../models/register-row-model';
import { RegisterTableRow } from '../components/registertable-row';
import { Register } from '../models/register';
import { Field } from '../models/field';
import { useAppSelector } from '../hooks';
import { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { Access } from '../models/access';
import { updateRegister } from '../store/registerActions';
import { removeFields } from '../store/fieldActions';
import { EnumeratedValue } from '../models/enumerated-value';

type RegisterTableProps = {
  currentRegister: string;
  removeFields: number;
};

const RegisterTable = (props: RegisterTableProps) => {
  const regs: readonly Register[] = useAppSelector((state) => state.registerReducer.registers);
  const storeFields: readonly Field[] = useAppSelector((state) => state.fieldReducer.fields);
  const storeEVS: readonly EnumeratedValue[] = useAppSelector((state) => state.enumeratedValueReducer.enumeratedValues);
  const [registerData, setRegisterData] = useState<RegisterTableRowData[]>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selection, setSelection] = useState(false);
  const dispatch: Dispatch<any> = useDispatch();

  const deleteFields = useCallback((fields: Field[]) => dispatch(removeFields(fields)), [dispatch, removeFields]);



  const onSelectAllClick: React.MouseEventHandler<HTMLTableHeaderCellElement> = (event) => {
    setSelectAll(!selectAll);
    handleSelectAll(selectAll);
  };

  useEffect(() => {
    if (props.removeFields === 1) {
      deleteItem('FIELDS');
      setSelection(false);
    } else if (props.removeFields === 0) {
      setSelection(true);
    }
  }, [props.removeFields]);

  const registerTableHasRowSelected = () => {
    if (registerData != null) {
      let arr = registerData.filter((row) => row.selected === true);
      return arr.length > 0 ? true : false;
    }
  };

  const handleRowSelected = (rowData: RegisterTableRowData) => {
    let newRegisterData = [...registerData];
    const index = registerData.findIndex((row) => row.id === rowData.id);
    newRegisterData[index].selected = !newRegisterData[index].selected;
    setRegisterData(newRegisterData);
  };

  const handleSelectAll = (selected: boolean) => {
    let newRegisterData = [...registerData];
    newRegisterData.forEach((row) => (row.selected = selected));
    setRegisterData(newRegisterData);
  };

  const deleteItem = (item: string) => {
    if (registerData != null) {
      let newRegisterData = [...registerData];
      let selectedRows = newRegisterData.filter((row) => row.selected);
      switch (item) {
        case 'FIELDS':
          let selectedFields = storeFields.filter((f) =>
            selectedRows.some((matchField) => f.id === matchField.fieldId),
          );

          selectedFields.forEach((field) => {
            let reg = regs.find((r) => field.parentRegID === r.id);
            reg.fields = reg.fields.filter((f) => f !== field.id);
            reg.defaultValue -= field.defaultValue * Math.pow(2, field.posl);
            field.access === Access.Write && (reg.mask -= Math.pow(2, field.posh + 1) - Math.pow(2, field.posl));
            updateRegister(reg);
          });
          deleteFields(selectedFields);
          break;
        // case 'EV':
        //   let selectedBks = blocks.filter((bk) => selectedRows.some((matchBk) => bk.id === matchBk.blockId));
        //   selectedBks.forEach((bk) => {
        //     let func = funcs.find((f) => bk.parentFunc === f.id);
        //     func.blocks = func.blocks.filter((b) => b !== bk.id);
        //     updateFunction(func);
        //   });
        //   deleteBks(selectedBks);
        //   setMappingSelectionMode('DEFAULT');
        //   break;

        default:
          break;
      }
      setRegisterData(newRegisterData.filter((row) => !row.selected));
      setSelection(false);
    }
  };

  useEffect(() => {
    let newRegisterData = Array<RegisterTableRowData>();
    let currentReg = regs.filter((reg) => reg.id === props.currentRegister)[0];
    if (currentReg != null && currentReg.fields != null && currentReg.fields.length > 0) {
      currentReg.fields.map((f) => {
        const field = storeFields.find((field) => field.id === f);
        const evsID = field.enumeratedValues;
        let evString = '';
        if (evsID != null && evsID.length > 0) {
          evsID.map((ev, idx) => {
            let fetchedEV = storeEVS.find(e => e.id === ev)
              
            console.log("fet", fetchedEV)
            console.log(storeEVS)
            console.log(evsID)
            if (fetchedEV != null) {
              evString += `${fetchedEV.name} : ${fetchedEV.value} : ${fetchedEV.description} \n`;
            } else {
              evString = '0 enumerated values';
            }
          });
        }

        let data = new RegisterTableRowData(
          uuidv4(),
          field.id,
          field.name,
          `[${field.posh}:${field.posl}]`,
          field.posh - field.posl + 1,
          field.defaultValue,
          Access[field.access],
          field.description,
          evString,
          false,
        );
        newRegisterData.push(data);
      });
    }

    setRegisterData(newRegisterData.length > 0 ? newRegisterData : null);
  }, [storeFields, storeEVS, props.currentRegister]);

  return (
    <div>
      {registerData ? (
        <div className="flex flex-col p-2">
          <div className="-my-2 sm:-mx-6 lg:-mx-8 pt-2 mb-2">
            <div className="py-2 align-middle sm:px-6 lg:px-8 ">
              <div className="overflow-x-auto rounded-lg h-75">
                <table className="border-separate rounded-xl table-auto w-full whitespace-no-wrap">
                  <thead>
                    <tr>
                      {selection && (
                        <th
                          onClick={onSelectAllClick}
                          scope="col"
                          className="hover:text-red-300 select-none text-white w-min px-2 py-3 text-center text-xs font-semibold bg-blueGray-500 dark:bg-gray-700 uppercase tracking-wider sticky top-0 shadow-xl rounded-tl-xl cursor-pointer"
                        >
                          Selected
                        </th>
                      )}
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left select-none text-xs font-semibold bg-blueGray-500 dark:bg-gray-800 text-white uppercase tracking-wider sticky top-0 shadow-xl ${
                          !selection && 'rounded-tl-xl'
                        }`}
                      >
                        Data Bit
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 w-1/6 text-left text-xs font-semibold bg-blueGray-500 dark:bg-gray-800 text-white uppercase tracking-wider sticky top-0 filter drop-shadow-2xl"
                      >
                        Field Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-500 dark:bg-gray-800 text-white uppercase tracking-wider sticky top-0 filter drop-shadow-2xl"
                      >
                        Size
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-500 dark:bg-gray-800 text-white uppercase tracking-wider sticky top-0 filter drop-shadow-2xl"
                      >
                        Default Value
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-500 dark:bg-gray-800 text-white uppercase tracking-wider sticky top-0 filter drop-shadow-2xl"
                      >
                        Access
                      </th>
                      <th
                        scope="col"
                        className="px-6 w-1/2 py-3 text-left text-xs font-semibold bg-blueGray-500 dark:bg-gray-800 text-white uppercase tracking-wider sticky top-0 filter drop-shadow-2xl "
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 w-1/2 py-3 text-left text-xs font-semibold bg-blueGray-500 dark:bg-gray-800 text-white uppercase tracking-wider sticky top-0 filter drop-shadow-2xl rounded-tr-xl"
                      >
                        Enumerated Values
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-blueGray-600 dark:bg-gray-800 overflow-y-scroll max-h-full h-full">
                    {registerData.map((field, idx) => (
                      <RegisterTableRow
                        key={field.id}
                        rowData={field}
                        onRowClick={() => alert('test')}
                        onRowSelected={handleRowSelected}
                        selection={selection}
                        rounded={idx + 1 == registerData.length ? true : false}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <h2 className="text-white text-center font-medium text-2xl align-middle pt-32 select-none">
          No fields, press "Add Field"
        </h2>
      )}
    </div>
  );
};

export default RegisterTable;
