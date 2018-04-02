import { expect } from 'chai';
import { HTMLElement, document }  from './helpers/helpers';

global.HTMLElement = HTMLElement;
global.document    = document;

import { $jst } from '../src/jayesstee';
const { describe, it } = global;

// console.log($jst);
describe('$jst', () => {

  $jst.config({installElementFuncs: true,
               installDocumentFuncs: true});

  // it('should create a single HTMLDivElement', () => {
  //   const div = $jst.$div();
  //   expect(result).to.be.an.instanceof('HTMLDivElement');
  // });
//
//   it('should return the same number if second param is null', () => {
//     const result = sum(10, null);
//     expect(result).to.be.equal(10);
//   });
});
