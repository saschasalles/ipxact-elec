import { RegisterTableRowData } from '../models/register-row-model';
import { MappingTableRowData } from '../models/mapping-row-model';
import { Tab } from '../models/tab-model';

export const initialMappingData: MappingTableRowData[] = [];

export const initialRegisterData: RegisterTableRowData[] = [];

export const initialTabs: Tab[] = [new Tab('0', 'Mapping', null, true, false)];
