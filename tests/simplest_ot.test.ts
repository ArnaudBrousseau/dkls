import { OTReceiver, OTSender } from '../src/simplest_ot';
import { utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils';

test('Exception thrown when no message in receiver', () => {
  const r = new OTReceiver(null, true);
  expect(() => { r.getMessage() }).toThrow("no message received yet");
})

test('Oblivious transfer end-to-end with c=1', () => {
  const message0 = utf8ToBytes("hello");
  const message1 = utf8ToBytes("goodbye");
  const s = new OTSender(null, message0, message1);
  
  // Set up our receiver with c = 1.
  const r = new OTReceiver(null, true);
  const S = s.publicKey();
  const R = r.publicKey(S);
  const encryptedMessages = s.encryptMessages(R);
  r.decrypt(encryptedMessages);
  expect(bytesToUtf8(r.getMessage())).toBe("goodbye");
});

test('Oblivious transfer end-to-end with c=0', () => {
  const message0 = utf8ToBytes("hello");
  const message1 = utf8ToBytes("goodbye");
  const s = new OTSender(null, message0, message1);
  
  // Set up our receiver with c = 1.
  const r = new OTReceiver(null, false);
  const S = s.publicKey();
  const R = r.publicKey(S);
  const encryptedMessages = s.encryptMessages(R);
  r.decrypt(encryptedMessages);
  expect(bytesToUtf8(r.getMessage())).toBe("hello");
});