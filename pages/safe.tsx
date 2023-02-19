import styles from '@styles/Home.module.css';
import { Inter } from '@next/font/google';
import Head from 'next/head';
import SafeInfo from '@components/SafeInfo';
import {
  Container,
  Text,
  Input,
  Divider,
  Button,
  VStack,
  Box,
  Link,
  Spinner,
} from '@chakra-ui/react';
import { Account } from '@components/Account';
import { useState } from 'react';
import useIsHydrated from '@hooks/useIsHydrated';
import { NextPage } from 'next';
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useRouter } from 'next/router';

const stringToBytes = (str: string) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

const Safe: NextPage = () => {
  const router = useRouter();
  //const isHydrated = useIsHydrated()
  const [txSigs, setTxSigs] = useState('');

  /*
  address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,bytes signatures
  */

  const { config } = usePrepareContractWrite({
    // redo this config
    address: '0xf2d48C7F6ff69b487f277BC011D853577c3880eb',
    abi: [
      {
        name: 'execTransaction',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          {
            to: '0000000000000000000000008a64e0b0506294ebb1ae2119d9f500dfb867033c',
            signatures: stringToBytes(txSigs),
          },
        ],
        outputs: [],
      },
    ],
    functionName: 'execTransaction',
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <>
      <Button variant='ghost' onClick={() => router.push('/')}>
        Go back
      </Button>
      <Container textAlign='center' py={10} px={10} maxW='1200px'>
        <Text as='h1'>The Safe</Text>
        <Text>
          Safe with Accountable Threshold Signatures with Proactive Refresh
        </Text>
        <Account />
        <Divider m={4} />
        <VStack gap={4}>
          <Text as='h3'>Add Signatures</Text>
          <Input
            placeholder='Add Signatures'
            value={txSigs}
            onChange={(e) => setTxSigs(e.target.value)}
            size='lg'
          />
          <Button
            disabled={!write}
            onClick={() => write?.()}
            colorScheme='teal'
            background='teal.800'
          >
            Verify Signatures
          </Button>
          {isLoading && (
            <Box>
              Verifying BLS signature!
              <Spinner />
              See on{' '}
              <Link href={`https://etherscan.io/tx/${data?.hash}`}>
                Etherscan
              </Link>
            </Box>
          )}
          {isSuccess && (
            <Box>
              Successfully verified BLS signature!
              <br />
              See on{' '}
              <Link href={`https://etherscan.io/tx/${data?.hash}`}>
                Etherscan
              </Link>
            </Box>
          )}
        </VStack>
      </Container>
    </>
  );
};
export default Safe;
