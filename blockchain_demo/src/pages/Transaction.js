import { Helmet } from 'react-helmet';
import {
  Box,
  Container,
  Grid
} from '@material-ui/core';
import TransactionInfo from '../components/transaction/TransactionInfo';

const Transaction = () => {
  const transactionLength = 5;
  const txLength = 10
  return (
    <>
      <Helmet>
        <title>Dashboard | Material Kit</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth={false}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
            >
              <TransactionInfo />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
};

export default Transaction;
