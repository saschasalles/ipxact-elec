import { store } from '../store/store';
import { Field } from '../models/field';
import { Register } from '../models/register';
import { Block } from '../models/block';
import { EnumeratedValue } from '../models/enumerated-value';
import { Project } from '../models/project';
import { Access } from '../models/access';
import { AddressSpace } from '../models/address-space';
import { v4 as uuidv4 } from 'uuid';
import { addProject as addProjectAction } from '../store/projectActions';
import { addFunction as addFunctionAction } from '../store/functionActions';
import { addField as addFieldAction } from '../store/fieldActions';

export const accessFormater = (accessVal?: Access, stringVal?: string): string | Access => {
  if (accessVal != null && stringVal == null) {
    switch (+accessVal) {
      case Access.Read:
        return 'read-only';
      case Access.Write:
        return 'write-only';
      case Access.ReadWrite:
        return 'read-write';
      case Access.ReadWriteOnce:
        return 'read-writeOnce';
      case Access.WriteOnce:
        return 'writeOnce';
      default:
        return 'read-only';
    }
  } else if (accessVal == null && stringVal != null) {
    switch (stringVal) {
      case 'read-only':
        return Access.Read;
      case 'write-only':
        return Access.Write;
      case 'read-write':
        return Access.ReadWrite;
      case 'read-writeOnce':
        return Access.ReadWriteOnce;
      case 'writeOnce':
        return Access.WriteOnce;
      default:
        return Access.Read;
    }
  }
};

export const fetchItems = (data: any): Project => {
  const project = new Project(
    uuidv4(),
    data.project.fileName,
    data.project.path,
    data.project.addressUnitBits,
    data.project.name,
    data.project.company,
    data.project.description,
    data.project.version,
  );
  store.dispatch(addProjectAction(project));

  data.funcs.forEach((func: any) => {
    const fetchedFunc = new AddressSpace(
      func.id,
      func.name,
      func.baseAddress,
      func.size,
      func.width,
      func.description,
      '',
      '',
      [],
      [],
    );

    const fetchedRegs = data.regs.filter((reg: any) => reg.parentFuncId === fetchedFunc.id);
    if (fetchedRegs != null) {
      fetchedRegs.forEach((reg: any) => {
        const fetchedReg = new Register(
          reg.id,
          reg.parentFuncId,
          reg.name,
          reg.addressOffset,
          accessFormater(null, reg.access) as Access,
          reg.description,
          0,
          0,
          0,
          0,
          false,
          reg.duplicateNb != null ? reg.duplicateNb : 0,
          null,
          [],
          reg.lastDuplicateIndex
        );

        fetchedFunc.registers.push(fetchedReg.id);
        const fetchedFields = data.fields.filter((field: any) => field.parentRegisterId === fetchedReg.id);
        if (fetchedFields != null) {
          fetchedFields.forEach((field: any) => {
            const fetchedField = new Field(
              field.id,
              field.parentRegisterId,
              field.name,
              0,
              field.description,
              accessFormater(null, field.access) as Access,
              field.bitOffset + field.bitWidth - 1,
              field.bitOffset,
              [],
            );

            const fetchedEvs = data.evs.filter((ev: any) => ev.parentFieldId === fetchedField.id);
            if (fetchedEvs != null) {
              fetchedEvs.forEach((ev: any) => {
                const fetchedEv = new EnumeratedValue(ev.id, ev.parentFieldId, ev.name, ev.value, ev.description);
                fetchedField.enumeratedValues.push(fetchedEv.id);
                EnumeratedValue.add(fetchedEv);
              });
            }

            fetchedReg.fields.push(fetchedField.id);
            store.dispatch(addFieldAction(fetchedField));
          });
        }
        Register.add(fetchedReg);
      });
    }

    const fetchedBks = data.blocks.filter((bk: any) => bk.parentFuncId === fetchedFunc.id);
    if (fetchedBks != null) {
      fetchedBks.forEach((bk: any) => {
        const fetchedBk = new Block(bk.id, bk.name, bk.baseAddress, bk.size, bk.width, bk.description, bk.parentFuncId);
        fetchedFunc.blocks.push(fetchedBk.id);
        Block.add(fetchedBk);
      });
    }

    store.dispatch(addFunctionAction(fetchedFunc));
  });

  return project;
};
