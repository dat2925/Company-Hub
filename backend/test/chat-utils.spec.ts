import { directConversationKey, uniqueEmployeeIds } from '../src/chat/chat-utils';

describe('chat helpers', () => {
  it('builds the same direct key regardless of participant order', () => {
    expect(directConversationKey('employee-b', 'employee-a')).toBe('employee-a:employee-b');
    expect(directConversationKey('employee-a', 'employee-b')).toBe('employee-a:employee-b');
  });

  it('deduplicates group members without changing their first-seen order', () => {
    expect(uniqueEmployeeIds(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });
});
