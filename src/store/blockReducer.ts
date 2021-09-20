import * as actionTypes from './actionTypes';
import { BlockAction, MultiBlocksAction, BlockState } from '../models/state';
import { v4 as uuidv4 } from 'uuid';
import { Block } from '../models/block';

const initialBlockState: BlockState = {
  blocks: [],
};

type BlockActions = BlockAction | MultiBlocksAction;

const blockReducer = (state: BlockState = initialBlockState, action: BlockActions): BlockState => {
  switch (action.type) {
    case actionTypes.ADD_BLOCK:
      if ('block' in action) {
        const newBlock: Block = action.block;
        return { ...state, blocks: state.blocks.concat(newBlock) };
      }

    case actionTypes.UPDATE_BLOCK:
      if ('block' in action) {
        const updatedBlock: Block = action.block;
        const newState = state.blocks.map((bk) => {
          if (bk.id === updatedBlock.id) {
            (bk.name = updatedBlock.name),
              (bk.baseAddress = updatedBlock.baseAddress),
              (bk.size = updatedBlock.size),
              (bk.width = updatedBlock.width);
            bk.parentFunc = updatedBlock.parentFunc;
          }
          return bk;
        });
        return { ...state, blocks: newState };
      }

    case actionTypes.REMOVE_BLOCKS:
      if ('blocks' in action) {
        const updatedBlocks: Block[] = state.blocks.filter((bk) => !action.blocks.includes(bk));
        return { ...state, blocks: updatedBlocks };
      }
  }
  return state;
};

export default blockReducer;
