import jinja2

templateLoader = jinja2.FileSystemLoader(searchpath="./prompts")

def _load_prompt_template(template_file:str) -> jinja2.Template:
    templateEnv = jinja2.Environment(loader=templateLoader)
    return templateEnv.get_template(template_file)

def make_prompt(template_file:str, **kwargs) -> str:
    return _load_prompt_template(template_file).render(**kwargs)