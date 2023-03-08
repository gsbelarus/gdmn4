import { ReactNode } from 'react';
import styled from 'styled-components';

const StyledTable = styled.table`
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
`;

const THead = styled.thead`

`;

const TFoot = styled.tfoot`

`;

const TBody = styled.tbody`

`;

const TR = styled.tr`
  :hover {background-color: #f2f2f2;};
`;

const TH = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  width: 200px;
  padding-top: 12px;
	padding-bottom: 12px;
	text-align: left;
	background-color: brown;
	color: white;
`;

const TD = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;

interface TableProps {
  children: ReactNode;
}

interface TableHeadProps {
  children: ReactNode;
}

interface TableBodyProps {
  children: ReactNode;
}

interface TableFootProps {
  children: ReactNode;
}

interface TableTHProps {
  children: ReactNode;
}

interface TableTRProps {
  children: ReactNode;
}

interface TableTDProps {
  children: ReactNode;
}

export const Table = ({ children, ...rest }: TableProps) => {
  return <StyledTable {...rest}>{children}</StyledTable>;
};

Table.Head = ({ children, ...rest }: TableHeadProps) => {
  return <THead {...rest}>{children}</THead>;
};

Table.Body = ({ children, ...rest }: TableBodyProps) => {
  return <TBody {...rest}>{children}</TBody>;
};

Table.Foot = ({ children, ...rest }: TableFootProps) => {
  return <TFoot {...rest}>{children}</TFoot>;
};

Table.TH = ({ children, ...rest }: TableTHProps) => {
  return <TH {...rest}>{children}</TH>;
};

Table.TR = ({ children, ...rest }: TableTRProps) => {
  return <TR {...rest}>{children}</TR>;
};

Table.TD = ({ children, ...rest }: TableTDProps) => {
  return <TD {...rest}>{children}</TD>;
};
