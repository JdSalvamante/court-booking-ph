"""The public booking endpoints, hung directly off the API prefix.

The access rule is empty: booking a court needs no Mistral caller, so every
route here is served without one, like the health routes.
"""

from fastapi import params

segment = ""

dependencies: tuple[params.Depends, ...] = ()
