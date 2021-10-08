import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/pages`;

type TDefaultPage = 'home' | 'projects' | 'all-input' | 'proposals' | 'events';
type TStandardPage = 'information' | 'faq' | 'accessibility-statement';
export type TFixedPage =
  | 'terms-and-conditions'
  | 'privacy-policy'
  | 'cookie-policy';

export const FIXED_PAGES: TFixedPage[] = [
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
];

export const STANDARD_PAGES_ALLOWED_TO_EDIT: TStandardPage[] = [
  'information',
  'faq',
];

export const FIXED_PAGES_ALLOWED_TO_EDIT: TFixedPage[] = [
  'terms-and-conditions',
  'privacy-policy',
];

type TPublicationStatus = 'draft' | 'published';

export interface IPageData {
  id: string;
  type: 'page';
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    slug: // to be found in cl2-back: config/tenant_templates/base.yml
    | TDefaultPage
      | TStandardPage
      | TFixedPage
      // if a custom page gets added, it can be different than the strings above
      | string;
    publication_status: TPublicationStatus;
    navbar_item: {
      title_multiloc: Multiloc;
    };
    created_at: string;
    updated_at: string;
  };
  relationships: {
    navbar_item: {
      data: IRelationship | null;
    };
    page_links: {
      data: IRelationship[];
    };
  };
}

export interface PageLink {
  type: 'page_links';
  id: string;
  attributes: {
    linked_page_slug: string;
    linked_page_title_multiloc: Multiloc;
    ordering: number;
  };
}

// interface IPageCreate {
//   title_multiloc: Multiloc;
//   body_multiloc: Multiloc;
//   slug: string;
//   publication_status: TPublicationStatus;
//   navbar_item_attributes: {
//     title_multiloc: Multiloc;
//   };
// }

// Update this in page edit iteration
interface IPageCreate {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug: string;
}

export interface IPageUpdate {
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  slug?: string;
  publication_status?: TPublicationStatus;
}

export interface IPage {
  data: IPageData;
}

export function listPages(streamParams: IStreamParams | null = null) {
  return streams.get<{ data: IPageData[] }>({
    apiEndpoint: `${apiEndpoint}`,
    ...streamParams,
  });
}

export function pageBySlugStream(
  pageSlug: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPage>({
    apiEndpoint: `${apiEndpoint}/by_slug/${pageSlug}`,
    ...streamParams,
  });
}

export function createPage(pageData: IPageCreate) {
  return streams.add<IPage>(`${apiEndpoint}`, pageData);
}

export function updatePage(pageId: string, pageData: IPageUpdate) {
  return streams.update<IPage>(`${apiEndpoint}/${pageId}`, pageId, pageData);
}

export function deletePage(pageId: string) {
  return streams.delete(`${apiEndpoint}/${pageId}`, pageId);
}

export function pageByIdStream(
  pageId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPage>({
    apiEndpoint: `${apiEndpoint}/${pageId}`,
    ...streamParams,
  });
}
