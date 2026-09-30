import { Button } from './components/Button';

   export function MyPage() {
     return (
       <Button variant="filled" color="dark" hasIcon onClick={() => console.log('Clicked!')}>
         Submit
       </Button>
     );
   }