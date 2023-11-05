import { init } from '../src';

test('can init', () => {
  expect(init("me", "you")).toBe("parties me and you are starting dkls");
});