import styled from 'styled-components'

export const Images = styled.div`
   display: flex;
   max-width: 55%;
   overflow: auto;
`

export const DeleteDiv = styled.div`
   position: absolute;
   right: 6px;
   top: 6px;
   cursor: pointer;
   &:hover {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
      transition: 0.3s;
   }
`
export const EditDiv = styled.div`
   position: absolute;
   right: 42px;
   top: 6px;
   cursor: pointer;
   &:hover {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
      transition: 0.3s;
   }
`

export const WrapperDiv = styled.div`
   position: relative;
   margin-left: 16px;
   display: flex;
   flex-direction: row;
   &:hover ${DeleteDiv} {
      display: block;
   }
   &:hover ${EditDiv} {
      display: block;
   }
`

export const Image = styled.img`
   width: 4.25rem;
   height: 4.25rem;
   border: ${({ active }) => (active ? `2px solid #02463a` : 0)};
   cursor: pointer;
   object-fit: cover;
`

export const Wrapper = styled.div`
   display: flex;
   flex-direction: row;
`

export const Trail = styled.div`
   width: 100%;
   margin: ${props => (props.hasImage ? '16px' : null)};
`

export const MainWrap = styled.div``

export const ImgWrapper = styled.div`
   width: 100%;
   padding-top: calc(591.44 / 1127.34 * 100%);
   position: relative;
   img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
   }
`
