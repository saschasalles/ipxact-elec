import * as actionTypes from './actionTypes';
import { Block } from '../models/block';
import { BlockAction, MultiBlocksAction } from '../models/state';

export const addBlock = (block: Block) => {
  const action: BlockAction = {
    type: actionTypes.ADD_BLOCK,
    block,
  };
  return action;
};

export const updateBlock = (block: Block) => {
  const action: BlockAction = {
    type: actionTypes.UPDATE_BLOCK,
    block,
  };
  return action;
};

export const removeBlocks = (blocks: Block[]) => {
  const action: MultiBlocksAction = {
    type: actionTypes.REMOVE_BLOCKS,
    blocks,
  };
  return action;
};
