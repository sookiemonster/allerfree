import jinja2

templateLoader = jinja2.FileSystemLoader(searchpath="./common/prompts")


def _load_prompt_template(template_file: str) -> jinja2.Template:
    templateEnv = jinja2.Environment(loader=templateLoader, enable_async=True)
    return templateEnv.get_template(template_file)


async def make_prompt(template_file: str, **kwargs) -> str:
    return await _load_prompt_template(template_file).render_async(**kwargs)
