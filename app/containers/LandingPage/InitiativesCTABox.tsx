import React, { memo } from 'react';

import styled, { withTheme } from 'styled-components';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { colors, fontSizes, media } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';

interface InputProps {
  className?: string;
}
interface DataProps {}

interface Props extends InputProps, DataProps {
  theme: any;
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #FFF;
  padding: 40px 80px;
  border: 1px solid ${colors.separation};
  justify-content: space-between;
  min-height: 250px;
  border-radius: ${({ theme }) => theme.borderRadius};
  position: relative;
  overflow: hidden;
  margin-bottom: 50px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    border-color: transparent;
    border-style: solid;
  }

  &::after {
    border-radius: 3px;
    border-width: 10px;
    border-right-color: ${colors.clGreen};
    border-top-color: ${colors.clGreen};
  }

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: flex-start;
    padding: 30px 40px;
    margin-bottom: 20px;
  `}
`;

const BackgroundIcon = styled(Icon)`
  height: 500px;
  width: auto;
  position: absolute;
  top: -200px;
  right: -150px;
  .cl-icon-primary {
    fill: rgba(4, 77, 108, 0.03);
  }
`;
const NewLabel = styled.div`
 position: absolute;
 z-index: 2;
 top: 11px;
 right: 15px;
 text-transform: uppercase;
 color: ${colors.clGreen};
 font-weight: 600;
`;

const Title = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxl}px;
  line-height: 33px;
  font-weight: 600;
  margin-bottom: 10px;
  max-width: 400px;
`;
const Text = styled.div`
  max-width: 400px;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  & > {
    margin-left: 20px;
  }

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    margin-left: 20px;
    & > {
      margin-top: 20px;
      margin-left: 0;
    }
  `}
  ${media.smallerThanMinTablet`
    margin-left: 0px;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    margin-top: 20px;
    & > {
      margin: 5px;
    }
  `}
`;

const InitiativesCTABox = withTheme(memo((props: Props) => {
  const { theme, className } = props;

  return (
    <Container className={className}>
      <BackgroundIcon name="initiatives"/>
      <NewLabel>
        <FormattedMessage {...messages.new} />
      </NewLabel>
      <div>
        <Title>
          <FormattedMessage {...messages.initiativesBoxTitle} />
        </Title>
        <Text>
          <FormattedMessage {...messages.initiativesBoxText} />
        </Text>
      </div>
      <ButtonContainer>
        <Button
          fontWeight="500"
          padding="13px 22px"
          bgColor="rgba(100, 100, 100, 0)"
          textColor={theme.colorMain}
          linkTo="/initiatives"
          text={<FormattedMessage {...messages.browseInitiative} />}
          className=""
        />
        <Button
          fontWeight="500"
          padding="13px 22px"
          bgColor={theme.colorMain}
          linkTo="/projects/an-idea-bring-it-to-your-council/ideas/new"
          textColor="#FFF"
          text={<FormattedMessage {...messages.startInitiative} />}
          className=""
        />
      </ButtonContainer>

    </Container>
  );
}));

export default InitiativesCTABox;
