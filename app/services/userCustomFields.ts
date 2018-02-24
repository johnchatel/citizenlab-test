import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';


export type IInputType = 'text' | 'multiline_text' | 'select' | 'multiselect' | 'checkbox' | 'date';

export interface ICustomFieldData {
  id: string;
  type: string;
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    input_type: IInputType;
    required: boolean;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    custom_field_options: {
      data: IRelationship;
    };
  };
}

export interface ICustomField {
  data: ICustomFieldData;
}

export interface ICustomFields {
  data: ICustomFieldData[];
}

export function customFieldForUsersStream(customFieldId: string) {
  return streams.get<ICustomField>({ apiEndpoint: `${API_PATH}/users/custom_fields/${customFieldId}` });
}

export function customFieldsForUsersStream() {
  return streams.get<ICustomFields>({ apiEndpoint: `${API_PATH}/users/custom_fields` });
}


export function addCustomFieldForUsers(data) {
  streams.add<ICustomField>(`${API_PATH}/users/custom_fields`, data);
}

export function updateCustomFieldForUsers(customFieldId: string, object) {
  return streams.update<ICustomField>(`${API_PATH}/users/custom_fields/${customFieldId}`, customFieldId, { custom_field: object });
}
