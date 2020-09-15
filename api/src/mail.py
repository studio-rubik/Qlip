import sib_api_v3_sdk as sib_sdk
from sib_api_v3_sdk.rest import ApiException

from .deps import smtp


def send_new_message_email(from_email, from_name, to_email, to_name, link):
    mail = sib_sdk.SendSmtpEmail(
        sender={"name": "Studio Rubik", "email": "noreply@studio-rubik.dev"},
        to=[{"name": to_name, "email": to_email}],
        template_id=2,
        params={"from_name": from_name, "to_name": to_name, "link": link},
    )
    try:
        smtp.send_transac_email(mail)
    except ApiException as e:
        print(e)
