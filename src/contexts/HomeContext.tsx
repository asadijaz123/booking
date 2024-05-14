import { createCustomContext } from "../utils/CreateCustomContext";

export interface IHomeState {
   showMyPlans: boolean;
   searchValue: string;
}

const initialHomeState: IHomeState = {
   showMyPlans: false,
   searchValue: "",
};

const functions = {
   setState: (state: IHomeState, setState: Partial<IHomeState>) => {
      return { ...state, ...setState };
   },
};
const { Context, Provider, useContextHook } = createCustomContext<
   IHomeState,
   typeof functions
>({
   initialState: initialHomeState,
   functions,
});

export const useHomeContext = useContextHook;
export const HomeContextProvider = Provider;
