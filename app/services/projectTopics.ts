import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

export interface IProjectTopicData {
  id: string;
  type: 'projects_topic';
  attributes: {
    ordering: number;
  };
  relationships: {
    project: {
      data: IRelationship;
    }
    topic: {
      data: IRelationship;
    }
  };
}

export interface IProjectTopic {
  data: IProjectTopicData;
}

export interface IProjectTopics {
  data: IProjectTopicData[];
}

const apiEndpoint = `${API_PATH}/projects`;

export async function deleteProjectTopic(projectId: string, topicId: string) {
  const response = await streams.delete(`${apiEndpoint}/${projectId}/topics/${topicId}`, topicId);
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/projects/${projectId}/topics`, `${API_PATH}/topics`] });
  return response;
}

export async function addProjectTopic(projectId: string, topicId: string) {
  const response = await streams.add(`${apiEndpoint}/${projectId}/topics`, { topic_id: topicId });
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/projects/${projectId}/topics`, `${API_PATH}/topics`] });
  return response;
}

export async function reorderProjectTopic(
  projectId: string,
  topicId: string,
  newOrder: number
) {
  return await streams.update(
    `${apiEndpoint}/${projectId}/topics/${topicId}/reorder`,
    topicId,
    {
      topic: {
        ordering: newOrder
      }
    }
  );
}

export function projectTopicsStream(projectId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IProjectTopics>({ apiEndpoint: `${apiEndpoint}/${projectId}/projects_topics`, ...streamParams });
}
