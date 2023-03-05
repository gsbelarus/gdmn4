import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin-left: 50px;
`;

const Avatar = styled.img`
  margin-top: 50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
`;

const Email = styled.h1`
  font-size: 2rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

const Bio = styled.p`
  font-size: 1.2rem;
`;

interface Props {
  email: string;
  bio: string;
  avatarUrl: string;
}

export const Profile: React.FC<Props> = ({ email, bio = "", avatarUrl }) => {
  return (
    <Container>
      <Avatar src={avatarUrl} />
      <Email>{email}</Email>
      <Bio>This is a user</Bio>
    </Container>
  );
};
