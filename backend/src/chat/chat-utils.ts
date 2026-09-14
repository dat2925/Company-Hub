export function directConversationKey(firstEmployeeId: string, secondEmployeeId: string) {
  return [firstEmployeeId, secondEmployeeId].sort().join(':');
}

export function uniqueEmployeeIds(ids: string[]) {
  return [...new Set(ids)];
}
