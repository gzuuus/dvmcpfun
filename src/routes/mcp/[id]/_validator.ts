import Ajv from "ajv";
import { Validator, addFormComponents, DEFAULT_AJV_CONFIG } from "@sjsf/ajv8-validator";

export const validator = new Validator({
  ajv: addFormComponents(new Ajv(DEFAULT_AJV_CONFIG))
}); 