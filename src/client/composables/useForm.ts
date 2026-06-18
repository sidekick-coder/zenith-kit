import { type ValibotObjectSchema, type ValibotSchema, type ValidatePayload, type ValidatorResult } from '#shared/index.ts';
import { toTypedSchema as  veeValidateToTypedSchema } from '@vee-validate/valibot';
import { useForm as useVeeValidateForm, type FormContext, type FormOptions, type GenericObject } from 'vee-validate';

export interface ValibotFormOptions<T extends ValibotSchema = ValibotSchema> 
    extends Omit<FormOptions<ValidatePayload<T>, ValidatorResult<T>>, 'validationSchema'> {}

export interface ValibotFormResultObject<T extends ValibotObjectSchema>
    extends GenericObject,
    FormContext<ValidatorResult<T>>
    {}

export const useForm = useValibotForm;

export const toTypedSchema = veeValidateToTypedSchema;

export function useValibotForm<T extends ValibotObjectSchema = ValibotObjectSchema>(schema: T, options: ValibotFormOptions<T> = {}): FormContext<ValidatorResult<T>> {
    return useVeeValidateForm({
        ...options,
        validationSchema: veeValidateToTypedSchema(schema as any),
    }) as any
}
