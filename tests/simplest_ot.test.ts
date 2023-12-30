import { OTReceiver, OTSender, runObliviousTransfer } from '../src/simplest_ot';
import { utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils';

test('Exception thrown when no message in receiver', () => {
  const r = new OTReceiver({choiceBit: true, privateKey: undefined});
  expect(() => { r.getMessage() }).toThrow("no message received yet");
})

test('Oblivious transfer end-to-end with c=1', () => {
  const message0 = utf8ToBytes("hello");
  const message1 = utf8ToBytes("goodbye");
  const s = new OTSender({message0, message1, privateKey: undefined});
  
  // Set up our receiver with c = 1.
  const r = new OTReceiver({choiceBit: true, privateKey: undefined});
  runObliviousTransfer(s, r);
  expect(bytesToUtf8(r.getMessage())).toBe("goodbye");
});

test('Oblivious transfer end-to-end with c=0', () => {
  const message0 = utf8ToBytes("hello");
  const message1 = utf8ToBytes("goodbye");
  const s = new OTSender({message0, message1, privateKey: undefined});
  
  // Set up our receiver with c = 0.
  const r = new OTReceiver({choiceBit: false, privateKey: undefined});
  runObliviousTransfer(s, r);
  expect(bytesToUtf8(r.getMessage())).toBe("hello");
});