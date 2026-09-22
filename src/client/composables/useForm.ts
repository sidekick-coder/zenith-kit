import { type ValibotObjectSchema, type ValidatorResult } from '#shared/services/ValidatorService.ts';
import * as v from 'valibot'
import { toTypedSchema as veeValidateToTypedSchema } from '@vee-validate/valibot';
import { useForm as useVeeValidateForm, type FormContext, type FormOptions, type GenericObject } from 'vee-validate';


export interface ValibotFormOptions<T extends ValibotObjectSchema = ValibotObjectSchema> 
    extends Omit<FormOptions<v.InferInput<T>, v.InferOutput<T>>, 'validationSchema'> {}

export interface ValibotFormResultObject<T extends ValibotObjectSchema>
    extends GenericObject,
    FormContext<ValidatorResult<T>>
    {}

export const useForm = useValibotForm;

export const toTypedSchema = veeValidateToTypedSchema;

export function useValibotForm<T extends ValibotObjectSchema = ValibotObjectSchema>(schema: T, options: ValibotFormOptions<T> = {}): FormContext<v.InferInput<T>, v.InferOutput<T>> {
    return useVeeValidateForm({
        ...options,
        validationSchema: veeValidateToTypedSchema(schema as any),
    }) as any
}
