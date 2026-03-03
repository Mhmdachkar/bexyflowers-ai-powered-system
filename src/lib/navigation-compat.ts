/**
 * Navigation compatibility layer
 * Re-exports from react-router-dom for centralized import management
 */

export {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';

export type {
  LinkProps,
  Location,
  NavigateFunction,
} from 'react-router-dom';
