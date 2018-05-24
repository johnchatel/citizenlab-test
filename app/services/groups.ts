import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';
import { TRule } from 'components/admin/UserFilterConditions/rules';

export interface IGroupData {
  id: string;
  type: 'groups';
  attributes: {
    title_multiloc: Multiloc;
    slug: string;
    memberships_count: number;
    membership_type: 'manual' | 'rules';
    rules?: TRule[];
  };
}

export interface GroupDiff {
  title_multiloc?: IGroupData['attributes']['title_multiloc'];
  rules?: IGroupData['attributes']['rules'];
  membership_type?: IGroupData['attributes']['membership_type'];
}

export interface IGroups {
  data: IGroupData[];
}
export interface IGroup {
  data: IGroupData;
}

export function getGroups(streamParams: IStreamParams | null = null) {
  return streams.get<IGroups>({ apiEndpoint: `${API_PATH}/groups`, ...streamParams });
}

export function getGroup(groupId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IGroup>({ apiEndpoint: `${API_PATH}/groups/${groupId}`, ...streamParams });
}

export function addGroup(object: GroupDiff) {
  return streams.add<IGroups>(`${API_PATH}/groups`, { group: object });
}

export function updateGroup(groupId: string, object: GroupDiff) {
  return streams.update<IGroup>(`${API_PATH}/groups/${groupId}`, groupId, { group: object });
}

export function deleteGroup(groupId: string) {
  return streams.delete(`${API_PATH}/groups/${groupId}`, groupId);
}
