// styling
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

// i18n
import messages from './messages';

// typings
import { InjectedIntlProps } from 'react-intl';
import { Response, PieRow, ReferrerTypeName } from './typings';
import { MessageDescriptor } from 'utils/cl-intl';

const REFERRER_TYPE_MESSAGES: Record<ReferrerTypeName, MessageDescriptor> = {
  'Direct Entry': messages.directEntry,
  'Social Networks': messages.socialNetworks,
  'Search Engines': messages.searchEngines,
  Websites: messages.websites,
  Campaigns: messages.campaigns,
};

export const parsePieData = (
  formatMessage: InjectedIntlProps['intl']['formatMessage'],
  data: Response['data']
): PieRow[] | null => {
  if (data.length === 0) return null;

  return data.map((row, i) => ({
    name: formatMessage(
      REFERRER_TYPE_MESSAGES[row.first_dimension_referrer_type_name]
    ),
    value: row.count,
    color: categoricalColorScheme({ rowIndex: i }),
  }));
};
