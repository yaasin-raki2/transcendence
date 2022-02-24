import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelctor: TypedUseSelectorHook<RootState> = useSelector;
