import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { connect } from 'react-redux';

import { Iterable } from 'Immutable';
const isImmutable = Iterable.isIterable;

const findTranslatedTextMutable = (value, userLocale, tenantLocales) => {
  let text = '';
  let transFound = true;

  if (value[userLocale]) {
    text = value[userLocale];
  } else {
    transFound = tenantLocales.some((tenantLocale) => {
      if (value[tenantLocale]) {
        text = value[tenantLocale];
        return true;
      }
      return false;
    });
  }
  if (!transFound) text = value.defaultMessage;
  return text;
};


function findTranslatedTextImmutable(value, userLocale, tenantLocales) {
  let text = '';
  let transFound = true;
  if (value.get(userLocale)) {
    text = value.get(userLocale);
  } else {
    transFound = tenantLocales.some((tenantLocale) => {
      if (value.get(tenantLocale)) {
        text = value.get(tenantLocale);
        return true;
      }
      return false;
    });
  }
  return text;
}

export const findTranslatedText = (value, userLocale, tenantLocales) => {
  if (!isImmutable(value)) {
    //console.log(new Error('Attention, Data Provided to the T component should be immutable!'));
    return findTranslatedTextMutable(value, userLocale, tenantLocales);
  };
  return findTranslatedTextImmutable(value, userLocale, tenantLocales);
};


// Wrap a component with this function to make props.tFunc available. tFunc
// works as the T component, but as a function. This is useful for passing a
// translated value as a prop, e.g. as a placeholder
export function injectTFunc(component) {
  const mapStateToProps = (state) => {
    const selectLocale = makeSelectLocale();
    const selectTenantLocales = makeSelectSetting(['core', 'locales']);
    return {
      tFunc(value) {
        return findTranslatedText(value, selectLocale(state), selectTenantLocales(state));
      },
    };
  };

  return connect(mapStateToProps)(component);
}
